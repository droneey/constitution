# Geometry

> Governs the space between elements, their corners, the strokes of icons and the edges of images.

## Space

### space-between-groups-twice-the-space-within · SHOULD

The space between two groups is at least twice the space between the items inside a group.

| Why |
|---|
| a reader sees what belongs together by how close it sits, and groups spaced like their items read as one list. |

## Corners

### nested-radius-concentric · SHOULD

A rounded element nested in another takes the outer radius less the space between them, so both curves share a centre, and is square where that leaves nothing.

| Why |
|---|
| an inner curve as round as the outer one leaves the gap thicker at the corners than along the sides, and the nesting looks misaligned. |

## Strokes

### icon-stroke-matches-its-text · SHOULD

An icon beside text draws its strokes as heavy as that text's.

| Why |
|---|
| an icon heavier than its label pulls the eye from it, and a lighter one fades beside it, so the pair stops reading as one control. |

## Edges

### content-image-edged-by-a-hairline · SHOULD

A content image carries a hairline inside its edge, in the text's colour at a low opacity, which darkens its edge in a light mode and lightens it in a dark one.

| Why |
|---|
| an image whose edge matches the surface around it bleeds into it, and the hairline drawn inside keeps its shape without changing its size. |
