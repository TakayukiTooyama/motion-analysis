import React, { useRef, useState, VFC } from 'react'
import * as posenet from '@tensorflow-models/posenet'
import {
  Box,
  Button,
  Heading,
  HStack,
  Stack,
  useDisclosure,
  Text,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import { drawKeypoints, drawSkeleton } from 'utils/utilities'
import DeleteDialog from 'components/AlertDialog'

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
  const canvasRef3 = useRef<HTMLCanvasElement>(null)

  const canvasImgRef = useRef<HTMLCanvasElement>(null)
  const image = canvasImgRef.current

  const [fileURL, setFileURL] = useState(null)
  const [, setPoseData] = useState<PoseData[]>([])

  const imageRef0 = useRef<HTMLImageElement>(null)
  const imageRef1 = useRef<HTMLImageElement>(null)
  const imageRef2 = useRef<HTMLImageElement>(null)
  const imageRef3 = useRef<HTMLImageElement>(null)
  const [images, setImages] = useState<
    { id: number; url: string; text: string }[]
  >([
    { id: 0, url: '', text: 'セット後' },
    { id: 1, url: '', text: '飛び出し時' },
    { id: 2, url: '', text: '1歩目' },
    { id: 3, url: '', text: '2歩目' },
  ])
  const [analyze, setAnalyze] = useState(false)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'delete' | 'analyze'>('delete')
  const [multiple, setMultiple] = useState(false)

  // 画像が選択されているかどうか
  const [state, setState] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ])

  // Load posenet
  const startPosenet = async () => {
    setLoading(true)
    setStatus('analyze')
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

    // imageRef0のwidthとheightが0になっている
    const imagesRef = [imageRef0, imageRef1, imageRef2, imageRef3]
    imagesRef.map(async (ref, idx) => {
      if (imageList[idx]) {
        setAnalyze(true)
        const image = ref.current

        const poses = multiple
          ? await net.estimateMultiplePoses(image, {
              flipHorizontal: false,
              maxDetections: 5,
              scoreThreshold: 0.5,
              nmsRadius: 20,
            })
          : await net.estimateSinglePose(image, {
              flipHorizontal: false,
            })

        const imageWidth = image.clientWidth
        const imageHeight = image.clientHeight
        image.width = imageWidth
        image.height = imageHeight

        state[idx] = false
        setState(state)
        /*
            0	鼻
            1	左目
            2	右目
            3	左耳
            4	右耳
            5	左肩
            6	右肩
            7	左肘
            8	右肘
            9	左手首
            10	右手首
            11	左尻
            12	右尻
            13	左膝
            14	右膝
            15	左足首
            16	右足首
          */
        // console.log(poses.keypoints)
        // console.log(
        //   '腰の位置',
        //   Math.max(
        //     poses.keypoints[11].position.y,
        //     poses.keypoints[12].position.y,
        //   ),
        // )

        // angle([])

        drawCanvas(poses, imageWidth, imageHeight, idx)
      }
    })
    setLoading(false)
    onOpen()
  }

  const drawCanvas = (
    pose: posenet.Pose | posenet.Pose[],
    imageWidth: number,
    imageHeight: number,
    idx: number,
  ) => {
    const canvas = [canvasRef0, canvasRef1, canvasRef2, canvasRef3]

    const selectedCanvas = canvas[idx].current
    const ctx = selectedCanvas.getContext('2d')
    selectedCanvas.width = imageWidth
    selectedCanvas.height = imageHeight

    if (multiple) {
      const poses = pose as posenet.Pose[]
      for (let i = 0; i < poses.length; i++) {
        drawKeypoints(poses[i]['keypoints'], 0.6, ctx)
        drawSkeleton(poses[i]['keypoints'], 0.5, ctx)
      }
    } else {
      drawKeypoints(pose['keypoints'], 0.6, ctx)
      drawSkeleton(pose['keypoints'], 0.5, ctx)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileURL(URL.createObjectURL(e.target.files[0]))
    video.load()
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
    startPosenet()
    // setTimeout(() => {
    //   video.play()
    // }, 4000)
  }

  const deleteImage = (ids: number[]) => {
    for (let i = 0; i < ids.length; i++) {
      images[ids[i]] = { ...images[ids[i]], url: '' }
      state[ids[i]] = false
    }
    setImages([...images])
    setState(state)
    setAnalyze(false)
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
    setStatus('delete')
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
        {text}
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
  const style3 = images[3].url !== '' && !state[3] ? 'absolute' : 'relative'

  return (
    <Stack spacing={4} pb={8}>
      <Heading as="h2" size="md" textAlign="center" pt={6} pb={2}>
        スタート動作分析{multiple ? '（複数人用）' : '（1人用）'}
      </Heading>
      <HStack align="center" pb={6}>
        <Button
          shadow="base"
          colorScheme={multiple ? null : 'teal'}
          w="100%"
          borderRadius="full"
          onClick={() => setMultiple(false)}
        >
          1人用
        </Button>
        <Button
          shadow="base"
          w="100%"
          colorScheme={multiple ? 'teal' : null}
          borderRadius="full"
          onClick={() => setMultiple(true)}
        >
          複数人用
        </Button>
      </HStack>
      <Video id="video" src={fileURL} controls ref={videoRef} />
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
      <Button
        colorScheme="teal"
        onClick={capture}
        disabled={!fileURL || images.every((image) => image.url !== '')}
      >
        キャプチャ
      </Button>
      <SimpleGrid columns={2} spacing={2}>
        {images[0].url ? (
          <Image
            src={images[0].url}
            onClick={() => ImageOnClick(images[0].id, images[0].text)}
            ref={imageRef0}
          />
        ) : (
          <NoImage id={images[0].id} text={images[0].text} />
        )}
        {images[1].url ? (
          <Image
            src={images[1].url}
            onClick={() => ImageOnClick(images[1].id, images[1].text)}
            ref={imageRef1}
          />
        ) : (
          <NoImage id={images[1].id} text={images[1].text} />
        )}
        {images[2].url ? (
          <Image
            src={images[2].url}
            onClick={() => ImageOnClick(images[2].id, images[2].text)}
            ref={imageRef2}
          />
        ) : (
          <NoImage id={images[2].id} text={images[2].text} />
        )}
        {images[3].url ? (
          <Image
            src={images[3].url}
            onClick={() => ImageOnClick(images[3].id, images[3].text)}
            ref={imageRef3}
          />
        ) : (
          <NoImage id={images[3].id} text={images[3].text} />
        )}
      </SimpleGrid>
      <Button
        colorScheme="teal"
        variant="outline"
        onClick={() => deleteImage([0, 1, 2, 3])}
      >
        画像リセット
      </Button>
      <Button
        colorScheme="teal"
        onClick={handleVideoAnalyze}
        disabled={images.every((image) => image.url === '')}
      >
        {loading ? '解析中' : '解析'}
      </Button>
      <Box display={analyze ? 'block' : 'none'} pt={8}>
        <Stack spacing={8} align="center">
          {images[0].url && (
            <>
              <Text fontSize="20px">セット後</Text>
              <Box position="relative" display="flex">
                <AnalyzeImage
                  style={{ position: `${style0}` }}
                  src={images[0].url}
                  ref={imageRef0}
                />
                <CanvasImg ref={canvasRef0} />
              </Box>
              <Flex shadow="base" h="100%" p={4} justifyContent="center">
                <Box mr={8}>
                  <Text mb={2}>腰の位置 : 〜〜</Text>
                  <Text>前足角度: 〜〜</Text>
                </Box>
                <Box>
                  <Text mb={2}>上半身の角度 : 〜〜</Text>
                  <Text>後足角度: 〜〜</Text>
                </Box>
              </Flex>
            </>
          )}
          {images[1].url && (
            <>
              <Text fontSize="20px">押し切り時</Text>
              <Box position="relative" display="flex">
                <AnalyzeImage
                  style={{ position: `${style1}` }}
                  src={images[1].url}
                  ref={imageRef1}
                />
                <CanvasImg ref={canvasRef1} />
              </Box>
              <Flex shadow="base" h="100%" p={4} justifyContent="center">
                <Box mr={8}>
                  <Text mb={2}>引く腕の角度 : 〜〜</Text>
                  <Text mb={2}>1歩目の膝の角度 : 〜〜</Text>
                </Box>
                <Box>
                  <Text>前に出す腕の角度: 〜〜</Text>
                </Box>
              </Flex>
            </>
          )}
          {images[2].url && (
            <>
              <Text fontSize="20px">1歩目</Text>
              <Box position="relative" display="flex">
                <AnalyzeImage
                  style={{ position: `${style2}` }}
                  src={images[2].url}
                  ref={imageRef2}
                />
                <CanvasImg ref={canvasRef2} />
              </Box>
              <Flex shadow="base" h="100%" p={4} justifyContent="center">
                <Box mr={8}>
                  <Text mb={2}>歩幅 : 〜〜</Text>
                  <Text>上体角度: 〜〜</Text>
                </Box>
                <Box>
                  <Text mb={2}>前膝角度 : 〜〜</Text>
                </Box>
              </Flex>
            </>
          )}
          {images[3].url && (
            <>
              <Text fontSize="20px">2歩目</Text>
              <Box position="relative" display="flex">
                <AnalyzeImage
                  style={{ position: `${style3}` }}
                  src={images[3].url}
                  ref={imageRef3}
                />
                <CanvasImg ref={canvasRef3} />
              </Box>
              <Flex shadow="base" h="100%" p={4} justifyContent="center">
                <Box mr={8}>
                  <Text mb={2}>歩幅 : 〜〜</Text>
                  <Text>上体角度: 〜〜</Text>
                </Box>
                <Box>
                  <Text mb={2}>前膝角度 : 〜〜</Text>
                </Box>
              </Flex>
            </>
          )}
        </Stack>
      </Box>
      <DeleteDialog
        isOpen={isOpen}
        onClose={onClose}
        deleteImage={deleteImage}
        selectedImage={selectedImage}
        status={status}
      />
      <Canvas ref={canvasImgRef} />
      <Box shadow="base" borderRadius="10px" p={4}>
        <Heading as="h2" size="md" mb={4} textAlign="center">
          補足
        </Heading>
        <Text>
          Safariで見ている場合は2回解析が必要かもしれません。のちに修正します。
        </Text>
      </Box>
      <Box shadow="base" borderRadius="10px" p={4}>
        <Heading as="h2" size="md" mb={4} textAlign="center">
          今後の展開
        </Heading>
        <Text>
          スタート時の関節角度や歩幅、スタート速度を出し、練習から客観的なデータを使って分析できるようにする。
          また、今回は無償のPoseNetを使って実装したが、AnyMotionなどのサービスを使った時と人の手による2次元動作分析を行った時などそれぞれどの程度差異が生まれるのか検証する。
          他にも、スタート動作だけではなく、陸上のあらゆる動作や他のスポーツの動作でも検証する。
        </Text>
      </Box>
    </Stack>
  )
}

export default Home

const Image = styled.img`
  width: 100%;
  height: 150px;
  z-index: 1;
  object-fit: cover;
  cursor: pointer;
`

const AnalyzeImage = styled.img`
  position: 'absolute';
  width: 100%;
  max-width: 400px;
  height: auto;
  z-index: 1;
`

const CanvasImg = styled.canvas`
  position: 'absolute';
  width: 100%;
  max-width: 400px;
  height: auto;
  z-index: 2;
  cursor: pointer;
`

const Canvas = styled.canvas`
  display: none;
`

const Video = styled.video`
  width: 100%;
  height: 300px;
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
  height: 150px;
  line-height: 150px;
  display: block;
  cursor: pointer;
`
