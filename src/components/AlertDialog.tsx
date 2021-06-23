import * as React from 'react'
import { useRef } from 'react'
import { VFC } from 'react'
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
} from '@chakra-ui/react'

type Props = {
  selectedImage: { id: number; text: string }
  isOpen: boolean
  onClose: () => void
  deleteImage: (ids: number[]) => void
  status: 'analyze' | 'delete'
}

const DeleteDialog: VFC<Props> = ({
  selectedImage,
  isOpen,
  onClose,
  deleteImage,
  status,
}) => {
  const cancelRef = useRef()

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader textAlign="center">
          {status === 'delete' ? '画像削除' : '解析完了'}
        </AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody textAlign="center">
          {status === 'delete'
            ? `${selectedImage.text}画像を削除してもよろしいですか？`
            : 'もし解析に時間がかかるようであればこの間に撮った動画を見れるようにする。また、別なページに遷移させ、動画に対してフィードバックする。（予定）'}
        </AlertDialogBody>
        <AlertDialogFooter>
          {status === 'delete' ? (
            <>
              <Button
                ref={cancelRef}
                onClick={onClose}
                w="100%"
                borderRadius="30px"
              >
                戻る
              </Button>
              <Button
                w="100%"
                borderRadius="30px"
                colorScheme="red"
                ml={3}
                onClick={() => deleteImage([selectedImage.id])}
              >
                OK
              </Button>
            </>
          ) : (
            <Button
              w="100%"
              colorScheme="teal"
              borderRadius="30px"
              onClick={onClose}
            >
              結果を見る
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteDialog
