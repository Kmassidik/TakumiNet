import Base

# Test (not a proof): the minimize rule behind F6.
# A bar is open (0) or collapsed (1). Pressing its handle flips it. Pressing
# twice must give back the starting state, and a saved state restores as saved.
# main returns the number of failed cases.

def flip(s: U32) -> U32:
  match s:
    case 0:
      1
    case _:
      0

def press_n(n: Nat, s: U32) -> U32:
  match n:
    case 0n:
      s
    case 1n+p:
      press_n(p, flip(s))

def differs(a: U32, b: U32) -> U32:
  match a:
    case 0:
      match b:
        case 0:
          0
        case _:
          1
    case _:
      match b:
        case 0:
          1
        case _:
          0

# two presses restore, from both starting states
def twice_open() -> U32:
  differs(press_n(2n, 0), 0)

def twice_collapsed() -> U32:
  differs(press_n(2n, 1), 1)

# an odd number of presses always ends in the other state
def odd_flips() -> U32:
  differs(press_n(5n, 0), 1)

def main() -> U32:
  (twice_open() + (twice_collapsed() + odd_flips()) : U32)
