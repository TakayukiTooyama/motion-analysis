import * as posenet from '@tensorflow-models/posenet'

const color = 'aqua'
const lineWidth = 2

export function drawKeypoints(
  keypoints: posenet.Keypoint[],
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale = 1,
): void {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i]

    if (keypoint.score < minConfidence) {
      continue
    }

    const { y, x } = keypoint.position
    drawPoint(ctx, y * scale, x * scale, 3, color)
  }
}

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number,
  color: string,
): void {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}

export function drawSkeleton(
  keypoints: posenet.Keypoint[],
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale = 1,
): void {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence,
  )

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      color,
      scale,
      ctx,
    )
  })
}

function toTuple({ y, x }: { y: number; x: number }): [number, number] {
  return [y, x]
}

export function drawSegment(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  color: string,
  scale: number,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.beginPath()
  ctx.moveTo(ax * scale, ay * scale)
  ctx.lineTo(bx * scale, by * scale)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.stroke()
}

export function angle(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  [cy, cx]: [number, number],
): void {
  const ba = new Array(2)
  ba[0] = ax - bx
  ba[1] = ay - by
  const bc = new Array(2)
  bc[0] = cx - bx
  bc[1] = cy - by

  const babc = ba[0] * bc[0] + ba[1] * bc[1]
  const ban = ba[0] * ba[0] + ba[1] * ba[1]
  const bcn = bc[0] * bc[0] + bc[1] * bc[1]
  const radian = Math.acos(babc / Math.sqrt(ban * bcn))
  const angle = (radian * 180) / Math.PI
}
