import { NextPage } from 'next'
import * as posenet from '@tensorflow-models/posenet'
import { useEffect, useRef, useState } from 'react'

// type Person = {
//   score: number
//   keypoints: KeyPoint[]
// }

// type KeyPoint = {
//   score: number
//   part: string
//   position: {
//     x: number
//     y: number
//   }
// }

const WebcamPage: NextPage = () => {
  const [fileURL, setFileURL] = useState(null)
  const playerRef = useRef(null)
  const [, setPoses] = useState<posenet.Pose>(null)
  const [taskId, setTaskId] = useState(null)

  useEffect(() => {
    const f = async () => {
      if (playerRef.current) {
        const net = await posenet.load({
          architecture: 'ResNet50',
          outputStride: 16,
          inputResolution: { width: 640, height: 480 },
        })

        if (fileURL) {
          const videoElement = document.getElementById(
            'myvideo',
          ) as HTMLVideoElement

          const task_id = setInterval(async () => {
            const tmpPoses = await net.estimateSinglePose(playerRef.current, {
              flipHorizontal: false,
            })
            console.log(videoElement.currentTime)
            console.log(videoElement.duration)
            console.log(tmpPoses)
            setPoses(tmpPoses)
          }, 1000)
          setTaskId(task_id)
        }
      }
    }
    f()
  }, [playerRef, fileURL])
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <video
        id="myvideo"
        ref={playerRef}
        autoPlay
        muted
        src={fileURL}
        width={'95%'}
        onEnded={() => {
          clearInterval(taskId)
        }}
      ></video>
      <input
        onChange={(e) => {
          if (e.target.files.length > 0) {
            const url = URL.createObjectURL(e.target.files[0])
            setFileURL(url)
          }
        }}
        type="file"
        multiple={false}
        accept="video/*"
      />
    </div>
  )
}

export default WebcamPage
