import Base

# Test (not a proof): the phone rule behind this feature.
# A screen is blocked when its width is under 600, or when it is short (height
# 500 or less) and its pointer is coarse (a finger). main returns the number of
# sample screens that are judged wrongly.

def blocked(+w: U32, +h: U32, +coarse: U32) -> U32:
  Bool.to_u32(Bool.or(U32.is_lt(w, 600), Bool.and(U32.is_le(h, 500), U32.is_eq(coarse, 1))))

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
    wrong(blocked(390, 844, 1), 1),
    wrong(blocked(430, 932, 1), 1),
    wrong(blocked(844, 390, 1), 1),
    wrong(blocked(932, 430, 1), 1),
    wrong(blocked(768, 1024, 1), 0),
    wrong(blocked(1024, 768, 1), 0),
    wrong(blocked(1440, 900, 0), 0),
    wrong(blocked(1100, 480, 0), 0),
    wrong(blocked(599, 900, 0), 1),
    wrong(blocked(600, 900, 0), 0)
  ])
