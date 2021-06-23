import React, { VFC } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react'

type Props = {
  isOpen: boolean
  onClose: () => void
  loading: boolean
}

const ResultModal: VFC<Props> = ({ isOpen, onClose, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{loading ? '解析中...' : '解析完了'}</ModalHeader>
        <ModalCloseButton />
        <ModalFooter>
          <Button
            colorScheme="teal"
            w="100%"
            borderRadius="30px"
            mr={3}
            onClick={onClose}
          >
            結果を見る
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ResultModal
