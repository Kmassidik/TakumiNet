import Base

# Test (not a proof): the template rule behind F11.
# Each example template names the devices it has, and the two ends of its
# built-in traffic. Both ends must be devices of that same template.
# main returns the number of template ends that point at a missing device.

def has(+k: U32, xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (Bool.to_u32(U32.is_eq(k, h)) + has(k, t) : U32)

def missing(+k: U32, devices: +List<U32>) -> U32:
  Bool.to_u32(U32.is_eq(has(k, devices), 0))

# Device ids are numbered per template. (from, to) are the traffic ends.
# connect: pc0=1 pc1=2        star: sw=1 pc0=2 pc1=3 pc2=4
# home: router=1 laptop=2 pc=3 server=4   routed: r=1 s0=2 s1=3 pc0=4 pc1=5 pc2=6 pc3=7
# web: sw=1 pc0=2 pc1=3 server=4
def connect() -> U32:
  (missing(1, [1, 2]) + missing(2, [1, 2]) : U32)

def star() -> U32:
  (missing(2, [1, 2, 3, 4]) + missing(4, [1, 2, 3, 4]) : U32)

def home() -> U32:
  missing(2, [1, 2, 3, 4])

def routed() -> U32:
  (missing(4, [1, 2, 3, 4, 5, 6, 7]) + missing(7, [1, 2, 3, 4, 5, 6, 7]) : U32)

def web() -> U32:
  missing(2, [1, 2, 3, 4])

def main() -> U32:
  (connect() + (star() + (home() + (routed() + web() : U32) : U32) : U32) : U32)
