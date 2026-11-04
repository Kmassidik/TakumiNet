import Base

# Test (not a proof): the language link rule for search engines.
# Pages are numbered: 1 landing en, 2 landing id, 3 about en, 4 about id.
# Each page lists the pages it names as alternates, itself included. Two rules:
# every page lists itself, and if page A lists page B then B lists A.
# main returns the number of rule breaks.

def has(+k: U32, xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (Bool.to_u32(U32.is_eq(k, h)) + has(k, t) : U32)

def pick_alts(ok: Bool) -> +List<U32>:
  match ok:
    case True{}:
      [1, 2]
    case False{}:
      [3, 4]

def alts(+page: U32) -> +List<U32>:
  pick_alts(U32.is_le(page, 2))

def lacks(+k: U32, xs: +List<U32>) -> U32:
  Bool.to_u32(U32.is_eq(has(k, xs), 0))

# page a lists b, but b does not list a
def not_back(+a: U32, +b: U32) -> U32:
  Bool.to_u32(Bool.and(U32.is_gt(has(b, alts(a)), 0), U32.is_eq(has(a, alts(b)), 0)))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([
    lacks(1, alts(1)), lacks(2, alts(2)), lacks(3, alts(3)), lacks(4, alts(4)),
    not_back(1, 2), not_back(2, 1), not_back(3, 4), not_back(4, 3),
    not_back(1, 3), not_back(1, 4), not_back(2, 3), not_back(2, 4)
  ])
