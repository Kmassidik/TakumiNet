import Base

# Test (not a proof): the colour rule behind F1.
# Colours are numbered. Every colour a rule uses must be one of the colours
# defined in the token file. main returns the number of used colours that are
# not defined.

def has(+k: U32, xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (Bool.to_u32(U32.is_eq(k, h)) + has(k, t) : U32)

def undefined(+k: U32, defined: +List<U32>) -> U32:
  Bool.to_u32(U32.is_eq(has(k, defined), 0))

def count(used: +List<U32>, +defined: +List<U32>) -> U32:
  match used:
    case Nil{}:
      0
    case Con{h, t}:
      (undefined(h, defined) + count(t, defined) : U32)

def main() -> U32:
  count([1, 2, 2, 3, 7, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9])
