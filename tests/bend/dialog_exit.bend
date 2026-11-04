import Base

# Test (not a proof): the dialog stack model behind F2/F5.
# Escape removes the top dialog and nothing else. Pressing it once per open
# dialog must leave the stack empty. main returns the number of failed cases.

def escape(xs: List<U32>) -> List<U32>:
  match xs:
    case Nil{}:
      Nil{}
    case Con{h, t}:
      t

def escape_n(n: Nat, xs: List<U32>) -> List<U32>:
  match n:
    case 0n:
      xs
    case 1n+p:
      escape_n(p, escape(xs))

def length(xs: List<U32>) -> Nat:
  match xs:
    case Nil{}:
      0n
    case Con{h, t}:
      1n+length(t)

def is_empty(xs: List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      1

# One failure point per case where the stack is not empty after enough presses.
def case_a() -> U32:
  is_empty(escape_n(length([1, 2, 3]), [1, 2, 3]))

def case_empty() -> U32:
  is_empty(escape_n(2n, []))

def case_extra() -> U32:
  is_empty(escape_n(5n, [7]))

def main() -> U32:
  (case_a() + (case_empty() + case_extra()) : U32)
