import Base

# Exhaustive finite check of the copper-pairing truth table, all 16
# combinations of auto/auto, same/different role and straight/cross cable.
# main returns the number of violated clauses; 0 means none.

def notb(b: Bool) -> Bool:
  match b:
    case True{}:
      False{}
    case False{}:
      True{}

def andb(a: Bool, b: Bool) -> Bool:
  match a:
    case True{}:
      b
    case False{}:
      False{}

def allowed(auto_a: Bool, auto_b: Bool, same: Bool, cross: Bool) -> Bool:
  match auto_a:
    case True{}:
      True{}
    case False{}:
      match auto_b:
        case True{}:
          True{}
        case False{}:
          match same:
            case True{}:
              cross
            case False{}:
              notb(cross)

def both_auto_bad(same: Bool, cross: Bool) -> Bool:
  notb(allowed(True{}, True{}, same, cross))

def one_auto_bad(+same: Bool, +cross: Bool) -> Bool:
  notb(andb(allowed(True{}, False{}, same, cross), allowed(False{}, True{}, same, cross)))

def same_fixed_bad(+cross: Bool) -> Bool:
  andb(allowed(False{}, False{}, True{}, cross), notb(cross))

def diff_fixed_bad(+cross: Bool) -> Bool:
  andb(allowed(False{}, False{}, False{}, cross), cross)

def bad(auto_a: Bool, auto_b: Bool, same: Bool, cross: Bool) -> Bool:
  match auto_a:
    case True{}:
      match auto_b:
        case True{}:
          both_auto_bad(same, cross)
        case False{}:
          one_auto_bad(same, cross)
    case False{}:
      match auto_b:
        case True{}:
          one_auto_bad(same, cross)
        case False{}:
          match same:
            case True{}:
              same_fixed_bad(cross)
            case False{}:
              diff_fixed_bad(cross)

def sum(xs: List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      U32.add(h, sum(t))

def main() -> U32:
  sum([
    Bool.to_u32(bad(True{}, True{}, True{}, True{})),
    Bool.to_u32(bad(True{}, True{}, True{}, False{})),
    Bool.to_u32(bad(True{}, True{}, False{}, True{})),
    Bool.to_u32(bad(True{}, True{}, False{}, False{})),
    Bool.to_u32(bad(True{}, False{}, True{}, True{})),
    Bool.to_u32(bad(True{}, False{}, True{}, False{})),
    Bool.to_u32(bad(True{}, False{}, False{}, True{})),
    Bool.to_u32(bad(True{}, False{}, False{}, False{})),
    Bool.to_u32(bad(False{}, True{}, True{}, True{})),
    Bool.to_u32(bad(False{}, True{}, True{}, False{})),
    Bool.to_u32(bad(False{}, True{}, False{}, True{})),
    Bool.to_u32(bad(False{}, True{}, False{}, False{})),
    Bool.to_u32(bad(False{}, False{}, True{}, True{})),
    Bool.to_u32(bad(False{}, False{}, True{}, False{})),
    Bool.to_u32(bad(False{}, False{}, False{}, True{})),
    Bool.to_u32(bad(False{}, False{}, False{}, False{}))
  ])
