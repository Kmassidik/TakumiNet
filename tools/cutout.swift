import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit
let a = CommandLine.arguments
guard a.count == 3, let img = CIImage(contentsOf: URL(fileURLWithPath: a[1])) else { print("usage: cutout in.png out.png"); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: img)
try h.perform([req])
guard let obs = req.results?.first else { print("no subject"); exit(2) }
let buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: h, croppedToInstancesExtent: false)
let out = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("ok", obs.allInstances.count, "instances")
