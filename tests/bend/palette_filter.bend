import Base

# Test (not a proof): the palette rule behind F7.
# Device kinds are numbered 0 to 8. Each kind must sit in exactly one category,
# so a tile never shows twice and never goes missing. main returns the number
# of kinds that are not in exactly one category.

def count_in(+k: U32, xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (Bool.to_u32(U32.is_eq(k, h)) + count_in(k, t) : U32)

def count_all(+k: U32, gs: +List<+List<U32>>) -> U32:
  match gs:
    case Nil{}:
      0
    case Con{g, rest}:
      (count_in(k, g) + count_all(k, rest) : U32)

def bad(+n: U32) -> U32:
  Bool.to_u32(U32.is_ne(n, 1))

def groups() -> +List<+List<U32>>:
  [[0, 1], [2], [3, 4, 5], [6], [7, 8]]

def check(n: Nat, +k: U32, +gs: +List<+List<U32>>) -> U32:
  match n:
    case 0n:
      0
    case 1n+p:
      (bad(count_all(k, gs)) + check(p, U32.inc(k), gs) : U32)

def main() -> U32:
  check(9n, 0, groups())
