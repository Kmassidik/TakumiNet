import Base

# Test (not a proof): the print scale rule behind F4.
# Zoom is counted in thousandths. zoom = min(page_w*1000/w, page_h*1000/h, 2000).
# A diagram of size (w, h) scaled by that zoom must fit inside the page:
# w*zoom <= page_w*1000 and h*zoom <= page_h*1000. main returns the number of
# sample diagrams that overflow the page.

def zoom(w: U32, h: U32, pw: U32, ph: U32) -> U32:
  U32.min(U32.min(U32.div(U32.mul(pw, 1000), w), U32.div(U32.mul(ph, 1000), h)), 2000)

def overflows(+w: U32, +h: U32, +pw: U32, +ph: U32) -> U32:
  +z = zoom(w, h, pw, ph)
  Bool.to_u32(Bool.or(U32.is_gt(U32.mul(w, z), U32.mul(pw, 1000)), U32.is_gt(U32.mul(h, z), U32.mul(ph, 1000))))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([
    overflows(4000, 300, 1754, 1240),
    overflows(200, 3000, 1754, 1240),
    overflows(1, 1, 1754, 1240),
    overflows(20000, 20000, 1754, 1240),
    overflows(640, 480, 1754, 1240),
    overflows(1754, 1240, 1754, 1240)
  ])
