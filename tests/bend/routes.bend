import Base

# Test (not a proof): the clean address rule behind F9.
# A page the app serves directly must not end in ".html". Old addresses are
# allowed only as redirects, so they are not in this list. main returns the
# number of served pages that break the rule.

def bad(p: String) -> U32:
  Bool.to_u32(String.ends_with(p, ".html"))

def served() -> +List<String>:
  ["/", "/about"]

def count(xs: +List<String>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (bad(h) + count(t) : U32)

def main() -> U32:
  count(served())
