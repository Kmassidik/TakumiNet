import Base

# Test (not a proof): the cable mode rule behind F16.
# Categories are numbered; 7 is Connections. After switching to category c with
# cable mode m (1 = on), the mode that remains must be 0 unless c is 7.
# main returns the number of cases that leave a cable mode on outside Connections.

def keep(ok: Bool, +mode: U32) -> U32:
  match ok:
    case True{}:
      mode
    case False{}:
      0

def after(+mode: U32, +cat: U32) -> U32:
  keep(U32.is_eq(cat, 7), mode)

def bad(+mode: U32, +cat: U32) -> U32:
  Bool.to_u32(Bool.and(U32.is_eq(after(mode, cat), 1), U32.is_ne(cat, 7)))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([bad(1, 1), bad(1, 2), bad(1, 6), bad(1, 8), bad(1, 9), bad(0, 3), bad(1, 7), bad(0, 7)])
