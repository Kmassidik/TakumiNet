import Base

# Exhaustive finite check (not a general theorem): the menu stepping rule.
# For every enabled pattern up to 5 items (all 2^n masks), every start (none or
# an item) and both directions, step must equal an independent distance fold,
# must never return a disabled item, and returns "none" exactly when nothing is
# enabled. main returns the number of counterexamples; 0 means none exist.

def eqn(a: Nat, b: Nat) -> Bool:
  match a:
    case 0n:
      match b:
        case 0n:
          True{}
        case 1n+p:
          False{}
    case 1n+p:
      match b:
        case 0n:
          False{}
        case 1n+q:
          eqn(p, q)

def nat_if(cond: Bool, yes: Nat, no: Nat) -> Nat:
  match cond:
    case True{}:
      yes
    case False{}:
      no

def lt(a: Nat, b: Nat) -> Bool:
  match a:
    case 0n:
      match b:
        case 0n:
          False{}
        case 1n+p:
          True{}
    case 1n+p:
      match b:
        case 0n:
          False{}
        case 1n+q:
          lt(p, q)

def odd(m: Nat) -> Bool:
  eqn(Nat.mod(m, 2n), 1n)

# Bit i of an enabled mask, recursively on the index.
def bit_at(i: Nat, mask: Nat) -> Bool:
  match i:
    case 0n:
      odd(mask)
    case 1n+p:
      bit_at(p, Nat.div(mask, 2n))

def inc(i: Nat, +n: Nat) -> Nat:
  Nat.mod(Nat.add(i, 1n), n)

def dec(i: Nat, +n: Nat) -> Nat:
  Nat.mod(Nat.add(i, Nat.sub(n, 1n)), n)

def next(at: Nat, forward: Bool, n: Nat) -> Nat:
  match forward:
    case True{}:
      inc(at, n)
    case False{}:
      dec(at, n)

def some_enabled(mask: Nat) -> Bool:
  match mask:
    case 0n:
      False{}
    case 1n+p:
      True{}

def distance(has: Bool, +from: Nat, forward: Bool, +j: Nat, +n: Nat) -> Nat:
  match has:
    case True{}:
      match forward:
        case True{}:
          nat_if(eqn(j, from), n, nat_if(lt(from, j), Nat.sub(j, from), Nat.sub(n, Nat.sub(from, j))))
        case False{}:
          nat_if(eqn(j, from), n, nat_if(lt(j, from), Nat.sub(from, j), Nat.sub(n, Nat.sub(j, from))))
    case False{}:
      match forward:
        case True{}:
          Nat.add(j, 1n)
        case False{}:
          Nat.sub(n, j)

# Independent reference: fold every candidate and keep the enabled one with
# the smallest distance. Ties cannot happen for distinct indices.
def best_loop(left: Nat, +mask: Nat, +n: Nat, +has: Bool, +from: Nat, +forward: Bool, +j: Nat, +best: Nat, +best_d: Nat) -> Nat:
  match left:
    case 0n:
      best
    case 1n+p:
      +d = distance(has, from, forward, j, n)
      +better = Bool.and(bit_at(j, mask), lt(d, best_d))
      +next_best = nat_if(better, j, best)
      +next_d = nat_if(better, d, best_d)
      best_loop(p, mask, n, has, from, forward, Nat.add(j, 1n), next_best, next_d)

def reference(+mask: Nat, +n: Nat, +has: Bool, +from: Nat, +forward: Bool) -> Nat:
  best_loop(n, mask, n, has, from, forward, 0n, 999n, 999n)

def start(+has: Bool, +from: Nat, +forward: Bool, +n: Nat) -> Nat:
  match has:
    case True{}:
      from
    case False{}:
      match forward:
        case True{}:
          dec(0n, n)
        case False{}:
          0n

def step_loop(left: Nat, +mask: Nat, +n: Nat, +at: Nat, +forward: Bool) -> Nat:
  match left:
    case 0n:
      999n
    case 1n+p:
      +i = next(at, forward, n)
      +rest = step_loop(p, mask, n, i, forward)
      nat_if(bit_at(i, mask), i, rest)

def step(+mask: Nat, +n: Nat, +has: Bool, +from: Nat, +forward: Bool) -> Nat:
  match n:
    case 0n:
      999n
    case 1n+p:
      step_loop(n, mask, n, start(has, from, forward, n), forward)

def enabled_bad(+some: Bool, +mask: Nat, +got: Nat) -> Nat:
  match some:
    case False{}:
      nat_if(eqn(got, 999n), 0n, 1n)
    case True{}:
      nat_if(bit_at(got, mask), 0n, 1n)

def failure(+mask: Nat, +n: Nat, +has: Bool, +from: Nat, +forward: Bool) -> Nat:
  +got = step(mask, n, has, from, forward)
  +want = reference(mask, n, has, from, forward)
  +bad_index = nat_if(eqn(got, want), 0n, 1n)
  +bad_enabled = enabled_bad(some_enabled(mask), mask, got)
  Nat.add(bad_index, bad_enabled)

def check_from_guard(left: Nat, +mask: Nat, +n: Nat, +from: Nat) -> Nat:
  match left:
    case 0n:
      0n
    case 1n+p:
      +has = lt(from, n)
      +here = Nat.add(failure(mask, n, has, from, True{}), failure(mask, n, has, from, False{}))
      Nat.add(here, check_from_guard(p, mask, n, 1n+from))

def check_mask(left: Nat, +mask: Nat, +n: Nat) -> Nat:
  match left:
    case 0n:
      0n
    case 1n+p:
      Nat.add(check_from_guard(1n+n, mask, n, 0n), check_mask(p, 1n+mask, n))

def pow2(n: Nat) -> Nat:
  match n:
    case 0n:
      1n
    case 1n+p:
      Nat.mul(2n, pow2(p))

def check_n(left: Nat, +n: Nat) -> Nat:
  match left:
    case 0n:
      0n
    case 1n+p:
      Nat.add(check_mask(pow2(n), 0n, n), check_n(p, 1n+n))

def to_u32(n: Nat) -> U32:
  match n:
    case 0n:
      0
    case 1n+p:
      U32.inc(to_u32(p))

def main() -> U32:
  to_u32(check_n(6n, 0n))
