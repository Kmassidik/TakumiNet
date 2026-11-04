import Base

# Test (not a proof): the "which slot does Takumi stand in" rule.
# Slot centres and the window middle are numbers (pixels). He picks the slot
# whose centre is nearest the middle. Scrolling down moves every centre up, so
# the pick must never jump backwards to an earlier slot. main returns the number
# of samples that break either rule.

def pick_diff(ok: Bool, +a: U32, +b: U32) -> U32:
  match ok:
    case True{}:
      U32.sub(a, b)
    case False{}:
      U32.sub(b, a)

def dist(+a: U32, +b: U32) -> U32:
  pick_diff(U32.is_ge(a, b), a, b)

def second(ok: Bool) -> U32:
  match ok:
    case True{}:
      1
    case False{}:
      2

def first(ok: Bool, rest: U32) -> U32:
  match ok:
    case True{}:
      0
    case False{}:
      rest

def pick3(+d0: U32, +d1: U32, +d2: U32) -> U32:
  first(Bool.and(U32.is_le(d0, d1), U32.is_le(d0, d2)), second(U32.is_le(d1, d2)))

# centres of three slots, moved up by `scroll`; index of the nearest to `mid`
def nearest(+scroll: U32, +mid: U32) -> U32:
  +d0 = dist(U32.sub(300, U32.min(scroll, 300)), mid)
  +d1 = dist(U32.sub(1100, U32.min(scroll, 1100)), mid)
  +d2 = dist(U32.sub(1900, U32.min(scroll, 1900)), mid)
  pick3(d0, d1, d2)

def goes_back(+a: U32, +b: U32) -> U32:
  Bool.to_u32(U32.is_gt(nearest(a, 400), nearest(b, 400)))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def wrong(+got: U32, +want: U32) -> U32:
  Bool.to_u32(U32.is_ne(got, want))

def main() -> U32:
  sum([
    goes_back(0, 200), goes_back(200, 600), goes_back(600, 900),
    goes_back(900, 1300), goes_back(1300, 1700),
    wrong(nearest(0, 400), 0),
    wrong(nearest(700, 400), 1),
    wrong(nearest(1500, 400), 2)
  ])
