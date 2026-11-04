import Base

# Test (not a proof): the Play rule behind F15.
# Model: a counter of runs started. Pressing Play while a run is already
# starting must not start another. press(started, starting) -> started'.
# main returns the number of scenarios that start more than one run.

def press(+started: U32, +starting: U32) -> U32:
  match starting:
    case 0:
      U32.inc(started)
    case _:
      started

# n presses while the first run is still starting (flag set after the first)
def presses(n: Nat, +started: U32, +starting: U32) -> U32:
  match n:
    case 0n:
      started
    case 1n+p:
      presses(p, press(started, starting), 1)

def too_many(+runs: U32) -> U32:
  Bool.to_u32(U32.is_gt(runs, 1))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([
    too_many(presses(1n, 0, 0)),
    too_many(presses(2n, 0, 0)),
    too_many(presses(5n, 0, 0)),
    too_many(presses(20n, 0, 0))
  ])
