import Base

# Test (not a proof): the file type rule behind F3.
# Save, export and import use ".xml". An older ".tnet" file may still be read,
# but nothing new is ever written as ".tnet". Any other name is refused.
# main returns the number of names that are judged wrongly.

def reads(+name: String) -> Bool:
  Bool.or(String.ends_with(name, ".xml"), String.ends_with(name, ".tnet"))

def writes(name: String) -> Bool:
  String.ends_with(name, ".xml")

def wrong(+got: Bool, +want: Bool) -> U32:
  Bool.to_u32(Bool.xor(got, want))

def sum(xs: +List<U32>) -> U32:
  match xs:
    case Nil{}:
      0
    case Con{h, t}:
      (h + sum(t) : U32)

def main() -> U32:
  sum([
    wrong(reads("lab.xml"), True{}),
    wrong(reads("old.tnet"), True{}),
    wrong(reads("lab.json"), False{}),
    wrong(reads("lab"), False{}),
    wrong(writes("lab.xml"), True{}),
    wrong(writes("old.tnet"), False{}),
    wrong(writes("lab.png"), False{})
  ])
