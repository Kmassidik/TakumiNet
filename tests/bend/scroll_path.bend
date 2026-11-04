import Base

# Test (not a proof): the scroll story rule.
# The camera has five stops at scroll 0, 25, 50, 75 and 100 (percent). For a
# scroll position, the stop index is how many stops are at or before it, minus 1.
# Scrolling down must never move the stop index backwards, and the end of the
# page must be the last stop. main returns the number of samples that break either rule.

def at_or_before(+scroll: U32, +stop: U32) -> U32:
  Bool.to_u32(U32.is_le(stop, scroll))

def stops_passed(+scroll: U32) -> U32:
  (at_or_before(scroll, 0) + (at_or_before(scroll, 25) + (at_or_before(scroll, 50) + (at_or_before(scroll, 75) + at_or_before(scroll, 100) : U32) : U32) : U32) : U32)

def goes_back(+a: U32, +b: U32) -> U32:
  Bool.to_u32(U32.is_lt(stops_passed(b), stops_passed(a)))

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
    goes_back(0, 10), goes_back(10, 24), goes_back(24, 25), goes_back(25, 60),
    goes_back(60, 74), goes_back(74, 99), goes_back(99, 100),
    wrong(stops_passed(0), 1),
    wrong(stops_passed(100), 5),
    wrong(stops_passed(50), 3)
  ])
