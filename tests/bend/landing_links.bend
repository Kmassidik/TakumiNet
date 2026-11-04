import Base

# Test (not a proof): the landing page link rule.
# Templates are numbered 1 to 10. Every link on the page names a template that
# exists, and every template is linked exactly once. main returns the number of
# templates that are missing or linked twice, plus links to templates that do not exist.

def count_in(+k: U32, xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (Bool.to_u32(U32.is_eq(k, h)) + count_in(k, t) : U32)

def not_once(+n: U32) -> U32:
  Bool.to_u32(U32.is_ne(n, 1))

def check(n: Nat, +k: U32, +links: +List<U32>) -> U32:
  match n:
    case 0n:
      0
    case 1n+p:
      (not_once(count_in(k, links)) + check(p, U32.inc(k), links) : U32)

def unknown(+k: U32) -> U32:
  Bool.to_u32(Bool.or(U32.is_lt(k, 1), U32.is_gt(k, 10)))

def count_unknown(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (unknown(h) + count_unknown(t) : U32)

def links() -> +List<U32>:
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

def main() -> U32:
  (check(10n, 1, links()) + count_unknown(links()) : U32)
