import Base

# Test (not a proof): the hover label placement rule.
# Label left edge x for a button at bx (width bw) and a label of width tw, in a
# window of width vw: centre it, then keep it inside [4, vw - tw - 4].
# main returns the number of sample buttons whose label ends up outside the window.

def centred(+bx: U32, +bw: U32, +tw: U32) -> U32:
  U32.sub(U32.add(bx, U32.shr(bw)), U32.shr(tw))

def left_edge(+bx: U32, +bw: U32, +tw: U32, +vw: U32) -> U32:
  U32.clamp(centred(bx, bw, tw), 4, U32.sub(vw, U32.add(tw, 4)))

def outside(+bx: U32, +bw: U32, +tw: U32, +vw: U32) -> U32:
  +x = left_edge(bx, bw, tw, vw)
  Bool.to_u32(Bool.or(U32.is_lt(x, 4), U32.is_gt(U32.add(x, tw), U32.sub(vw, 4))))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([
    outside(100, 30, 80, 1000),
    outside(0, 30, 80, 1000),
    outside(990, 30, 80, 1000),
    outside(500, 20, 200, 1000),
    outside(5, 22, 120, 400)
  ])
