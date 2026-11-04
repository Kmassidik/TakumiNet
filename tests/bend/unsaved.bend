import Base

# Test (not a proof): the leave-the-page warning rule behind F20.
# warn(count, changed, clean_known): warn only when the workspace holds something
# (count > 0), it differs from the clean one (changed = 1), and a clean point
# exists (clean_known = 1). main returns the number of scenarios decided wrongly.

def and3(+a: U32, +b: U32, +c: U32) -> U32:
  Bool.to_u32(Bool.and(U32.is_gt(a, 0), Bool.and(U32.is_eq(b, 1), U32.is_eq(c, 1))))

def wrong(+got: U32, +want: U32) -> U32:
  Bool.to_u32(U32.is_ne(got, want))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([
    wrong(and3(3, 1, 1), 1),
    wrong(and3(0, 1, 1), 0),
    wrong(and3(3, 0, 1), 0),
    wrong(and3(3, 1, 0), 0),
    wrong(and3(0, 0, 0), 0)
  ])
