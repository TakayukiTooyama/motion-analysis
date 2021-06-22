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
  deleteImage: (id: number) => void
}

const DeleteDialog: VFC<Props> = ({
  selectedImage,
  isOpen,
  onClose,
  deleteImage,
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
        <AlertDialogHeader>画像削除</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          {selectedImage.text}画像を削除してもよろしいですか？
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            戻る
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            onClick={() => deleteImage(selectedImage.id)}
          >
            OK
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteDialog
