import Base

# Test (not a proof): the sidebar width rule behind F8.
# Table columns are percentages. Events columns must add up to exactly 100.
# Capture columns (wide and narrow layouts) must leave at least 10 for Info.
# main returns the number of rules that fail.

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def not_eq(+a: U32, +b: U32) -> U32:
  Bool.to_u32(U32.is_ne(a, b))

def too_big(+a: U32, +limit: U32) -> U32:
  Bool.to_u32(U32.is_gt(a, limit))

def events_cols() -> +List<U32>:
  [9, 19, 26, 26, 20]

def capture_wide() -> +List<U32>:
  [10, 13, 17, 17, 13, 10]

def capture_narrow() -> +List<U32>:
  [12, 21, 21, 16]

def main() -> U32:
  (not_eq(sum(events_cols()), 100) + (too_big(sum(capture_wide()), 90) + too_big(sum(capture_narrow()), 90)) : U32)
