import Base

# Test (not a proof): the Alt rule behind F17.
# Events after Alt goes down: 0 = nothing, 1 = another key or a mouse press.
# Releasing Alt wakes the menu bar only if no event of kind 1 came in between.
# main returns the number of scenarios that decide wrongly.

def seen_other(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + seen_other(t) : U32)

def wakes(+events: +List<U32>) -> U32:
  Bool.to_u32(U32.is_eq(seen_other(events), 0))

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
    wrong(wakes([]), 1),
    wrong(wakes([1]), 0),
    wrong(wakes([0, 1]), 0),
    wrong(wakes([1, 1, 1]), 0)
  ])
