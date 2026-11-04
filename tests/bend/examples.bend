import Base

# Test (not a proof): the Examples menu rule behind F10.
# Items are numbered. 1 to 5 are lessons, 6 to 10 are templates. Each item must
# appear in exactly one of the two menu sections. main returns the number of
# items that are missing or listed twice.

def count_in(+k: U32, xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (Bool.to_u32(U32.is_eq(k, h)) + count_in(k, t) : U32)

def bad(+n: U32) -> U32:
  Bool.to_u32(U32.is_ne(n, 1))

def lessons() -> +List<U32>:
  [1, 2, 3, 4, 5]

def templates() -> +List<U32>:
  [6, 7, 8, 9, 10]

def check(n: Nat, +k: U32) -> U32:
  match n:
    case 0n:
      0
    case 1n+p:
      (bad((count_in(k, lessons()) + count_in(k, templates()) : U32)) + check(p, U32.inc(k)) : U32)

def main() -> U32:
  check(10n, 1)
