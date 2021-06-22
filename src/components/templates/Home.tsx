import React, { useRef, useState, VFC } from 'react'
import * as posenet from '@tensorflow-models/posenet'
import { Box, Button, Stack, useDisclosure } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { drawKeypoints, drawSkeleton } from 'utils/utilities'
import DeleteDialog from 'components/AlertDialog'
import dynamic from 'next/dynamic'
import { css, jsx } from '@emotion/react'
import { useEffect } from 'react'

type PoseData = {
  poses: posenet.Pose
  currentTime: number
}

const Home: VFC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedImage, setSelectedImage] = useState<{
    id: number
    text: string
  }>({ id: 0, text: '' })
  const videoRef = useRef<HTMLVideoElement>(null)
  const video = videoRef.current

  const canvasRef0 = useRef<HTMLCanvasElement>(null)
  const canvasRef1 = useRef<HTMLCanvasElement>(null)
  const canvasRef2 = useRef<HTMLCanvasElement>(null)

  const canvasImgRef = useRef<HTMLCanvasElement>(null)
  const image = canvasImgRef.current

  const [fileURL, setFileURL] = useState(null)
  const [poseData, setPoseData] = useState<PoseData[]>([])

  const imageRef0 = useRef<HTMLImageElement>(null)
  const imageRef1 = useRef<HTMLImageElement>(null)
  const imageRef2 = useRef<HTMLImageElement>(null)
  const [images, setImages] = useState<
    { id: number; url: string; text: string }[]
  >([
    { id: 0, url: '', text: 'セット後の' },
    { id: 1, url: '', text: '1歩目の' },
    { id: 2, url: '', text: '2歩目の' },
  ])
  const [analyze, setAnalyze] = useState(false)

  // 画像が選択されているかどうか
  const [state, setState] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])

  // Load posenet
  const startPosenet = async () => {
    const net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 16,
      inputResolution: 600,
      quantBytes: 2,
    })
    imageAnalyze(net)
  }

  const imageAnalyze = async (net: posenet.PoseNet) => {
    const imageList = images.map((image) => {
      if (image.url !== '') {
        return true
      }
      return false
    })

    const imagesRef = [imageRef0, imageRef1, imageRef2]
    imagesRef.map(async (ref, idx) => {
      if (imageList[idx]) {
        const image = ref.current
        const poses = await net.estimateSinglePose(image, {
          flipHorizontal: false,
        })
        const imageWidth = image.clientWidth
        const imageHeight = image.clientHeight

        image.width = imageWidth
        image.height = imageHeight

        state[idx] = false
        setState(state)
        console.log(poses)

        drawCanvas(poses, imageWidth, imageHeight, idx)
        setAnalyze(true)
      }
    })
  }

  const drawCanvas = (
    pose: posenet.Pose,
    imageWidth: number,
    imageHeight: number,
    idx: number,
  ) => {
    const canvas = [canvasRef0, canvasRef1, canvasRef2]

    const selectedCanvas = canvas[idx].current
    const ctx = selectedCanvas.getContext('2d')
    selectedCanvas.width = imageWidth
    selectedCanvas.height = imageHeight

    drawKeypoints(pose['keypoints'], 0.7, ctx)
    drawSkeleton(pose['keypoints'], 0.7, ctx)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileURL(URL.createObjectURL(e.target.files[0]))
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
  ) => {
    const file = e.target.files[0]
    const blobUrl = window.URL.createObjectURL(file)
    images[id] = { ...images[id], url: blobUrl }
    setImages([...images])
    state[id] = true
    setState(state)
  }

  const handleVideoAnalyze = () => {
    setPoseData([])
    // video.load()
    startPosenet()
    // setTimeout(() => {
    //   video.play()
    // }, 4000)
  }

  const deleteImage = (id: number) => {
    images[id] = { ...images[id], url: '' }
    setImages([...images])
    state[id] = false
    setState(state)
    onClose()
  }

  const capture = () => {
    if (image && video) {
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      image.width = videoWidth
      image.height = videoHeight
      const ctx = image.getContext('2d')

      ctx.drawImage(video, 0, 0, image.width, image.height)
      const imgId = images.find((image) => image.url === '').id
      images[imgId] = {
        ...images[imgId],
        id: imgId,
        url: image.toDataURL(),
      }
      setImages([...images])
    }
  }

  const ImageOnClick = (id: number, text: string) => {
    onOpen()
    setSelectedImage({ id, text })
  }

  type Props = {
    id: number
    text: string
  }

  const NoImage: VFC<Props> = ({ id, text }) => (
    <Box
      w="100%"
      textAlign="center"
      bg="#F5F2F0"
      border="1px dotted"
      _hover={{ opacity: '0.7' }}
    >
      <ImageLabel>
        {text}画像
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleImageUpload(e, id)}
        />
      </ImageLabel>
    </Box>
  )

  const style0 = images[0].url !== '' && !state[0] ? 'absolute' : 'relative'
  const style1 = images[1].url !== '' && !state[1] ? 'absolute' : 'relative'
  const style2 = images[2].url !== '' && !state[2] ? 'absolute' : 'relative'

  return (
    <Box>
      <Stack spacing={4} py={8}>
        <Video id="video" src={fileURL} controls ref={videoRef} />
        <Button
          colorScheme="teal"
          onClick={capture}
          disabled={!fileURL || images.every((image) => image.url !== '')}
        >
          キャプチャ
        </Button>
        <Button colorScheme="teal" variant="outline" p={0} w="100%">
          <Label>
            {fileURL ? '選択' : '動画'}
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />
          </Label>
        </Button>
        <Box>
          {images[0].url ? (
            <Wrapper>
              <Image
                style={{ position: `${style0}` }}
                src={images[0].url}
                onClick={() => ImageOnClick(images[0].id, images[0].text)}
                ref={imageRef0}
              />
              <CanvasImg
                ref={canvasRef0}
                onClick={() => ImageOnClick(images[0].id, images[0].text)}
              />
            </Wrapper>
          ) : (
            <NoImage id={images[0].id} text={images[0].text} />
          )}
        </Box>
        <Box>
          {images[1].url ? (
            <Wrapper>
              <Image
                style={{ position: `${style1}` }}
                src={images[1].url}
                onClick={() => ImageOnClick(images[1].id, images[1].text)}
                ref={imageRef1}
              />
              <CanvasImg
                ref={canvasRef1}
                onClick={() => ImageOnClick(images[1].id, images[1].text)}
              />
            </Wrapper>
          ) : (
            <NoImage id={images[1].id} text={images[1].text} />
          )}
        </Box>
        <Box>
          {images[2].url ? (
            <Wrapper>
              <Image
                style={{ position: `${style2}` }}
                src={images[2].url}
                onClick={() => ImageOnClick(images[2].id, images[2].text)}
                ref={imageRef2}
              />
              <CanvasImg
                ref={canvasRef2}
                onClick={() => ImageOnClick(images[2].id, images[2].text)}
              />
            </Wrapper>
          ) : (
            <NoImage id={images[2].id} text={images[2].text} />
          )}
        </Box>

        <DeleteDialog
          isOpen={isOpen}
          onClose={onClose}
          deleteImage={deleteImage}
          selectedImage={selectedImage}
        />
        <Canvas ref={canvasImgRef} />
        <Button
          colorScheme="teal"
          onClick={handleVideoAnalyze}
          disabled={images.length === 0}
        >
          解析
        </Button>
      </Stack>
    </Box>
  )
}

export default Home

const Wrapper = styled.div`
  position: relative;
  display: flex;
`

const Image = styled.img`
  position: absolute;
  width: 100%;
  height: 300px;
  z-index: 1;
  object-fit: contain;
  cursor: pointer;
`

const CanvasImg = styled.canvas`
  position: 'absolute';
  width: 100%;
  height: 300px;
  z-index: 2;
  object-fit: contain;
  cursor: pointer;
`

const Canvas = styled.canvas`
  display: none;
`

const Video = styled.video`
  width: 100%;
  height: 300px;
  object-fit: contain;
  background: #000;
`

const Label = styled.label`
  width: 100%;
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  cursor: pointer;
`

const ImageLabel = styled.label`
  width: 100%;
  height: 200px;
  line-height: 200px;
  display: block;
  cursor: pointer;
`
