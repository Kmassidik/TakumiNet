import Base

# Test (not a proof): the canvas buffer rule behind F14.
# The drawing buffer must equal css size times the pixel ratio, for every box
# the canvas can have (bars collapsed, sidebar hidden, splitter moved).
# main returns the number of sample boxes whose buffer is the wrong size.

def wrong(+css: U32, +ratio: U32, +buffer: U32) -> U32:
  Bool.to_u32(U32.is_ne(U32.mul(css, ratio), buffer))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

# (css, ratio, buffer after the fix) from the sizes seen in the browser
def main() -> U32:
  sum([
    wrong(1176, 2, 2352),
    wrong(413, 2, 826),
    wrong(501, 2, 1002),
    wrong(1512, 2, 3024),
    wrong(426, 2, 852)
  ])
