import Base

# Test (not a proof): the arrow-key rule behind the menu bar.
# A menu is a list of flags: 1 = item can be chosen, 0 = separator or disabled.
# Pressing Down from any item must land on a flag of 1, wrapping round.
# main returns the number of start positions where it lands on a 0.

def at(xs: +List<U32>, i: Nat) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      match i:
        case 0n:
          h
        case 1n+p:
          at(t, p)

def pick(ok: Bool, +j: U32, rest: U32) -> U32:
  match ok:
    case True{}:
      j
    case False{}:
      rest

# From index i (0 based) look at most n positions ahead, wrapping at size.
def next_from(n: Nat, +flags: +List<U32>, +i: U32, +size: U32) -> U32:
  match n:
    case 0n:
      size
    case 1n+p:
      +j = U32.mod(U32.inc(i), size)
      pick(U32.is_eq(at(flags, U32.to_nat(j)), 1), j, next_from(p, flags, j, size))

def lands_on_zero(+flags: +List<U32>, +i: U32, +size: U32) -> U32:
  +r = next_from(6n, flags, i, size)
  Bool.to_u32(Bool.and(U32.is_lt(r, size), U32.is_eq(at(flags, U32.to_nat(r)), 0)))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def flags() -> +List<U32>:
  [1, 1, 0, 1, 0, 1]

def main() -> U32:
  sum([
    lands_on_zero(flags(), 0, 6),
    lands_on_zero(flags(), 1, 6),
    lands_on_zero(flags(), 2, 6),
    lands_on_zero(flags(), 3, 6),
    lands_on_zero(flags(), 4, 6),
    lands_on_zero(flags(), 5, 6)
  ])
