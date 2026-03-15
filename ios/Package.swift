// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "HeliosPrime",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(
            name: "HeliosPrime",
            targets: ["HeliosPrime"]
        ),
    ],
    targets: [
        .target(
            name: "HeliosPrime"
        ),
    ]
)
