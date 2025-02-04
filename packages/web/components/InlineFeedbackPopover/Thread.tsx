import React, { useEffect, useMemo, useRef } from 'react'

import { useTranslation } from '@/config/i18n'
import { sanitize } from '@/utils'
import {
  useCreateCommentMutation,
  useCreateThreadMutation,
  UserFragmentFragment as UserType,
  ThreadFragmentFragment as ThreadType,
} from '@/generated/graphql'

import theme from '@/theme'
import Comment from './Comment'
import Button, { ButtonVariant } from '@/components/Button'
import Textarea from '@/components/Textarea'

export type PendingThreadData = {
  postId: number
  startIndex: number
  endIndex: number
  highlightedContent: string
}

export type ThreadOrHighlightProps =
  | { thread: ThreadType; pendingThreadData?: never }
  | { thread?: never; pendingThreadData?: PendingThreadData }

type ThreadProps = {
  onNewComment: (threadId: number) => void
  onUpdateComment: () => void
  close: () => void
  currentUser: UserType | null | undefined
} & ThreadOrHighlightProps

const Thread: React.FC<ThreadProps> = ({
  thread,
  pendingThreadData,
  onNewComment,
  onUpdateComment,
  close,
  currentUser,
}) => {
  const { t } = useTranslation('comment')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = React.useState(false)
  const [createComment] = useCreateCommentMutation()
  const [createThread] = useCreateThreadMutation()

  useEffect(() => textareaRef.current?.focus(), [])

  const createNewComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const commentBody = textareaRef.current?.value
    if (!textareaRef.current || !commentBody) return

    setLoading(true)

    try {
      if (pendingThreadData) {
        const { data } = await createThread({
          variables: {
            ...pendingThreadData,
            body: commentBody
          }
        })

        if (!data) {
          throw new Error('Thread creation failed!')
        }

        onNewComment(data.createThread.id)
      } else if (thread) {
        await createComment({
          variables: {
            threadId: thread.id,
            body: commentBody,
          },
        })

        onNewComment(thread.id)
      }


      textareaRef.current.value = ''
    } catch (e) {
      console.error('Error creating comment or thread: ', e)
    }

    setLoading(false)
  }

  const comments = thread?.comments || []
  const archived = thread?.archived || false
  const highlightedContent = (pendingThreadData || thread)?.highlightedContent || ''

  const sanitizedHTML = useMemo(
    () => sanitize(highlightedContent),
    [highlightedContent]
  )

  return (
    <div className="thread">
      <div className="thread-subject">
        <span className="highlighted-content" dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
      </div>
      <div className="thread-body">
        <div className="comments">
          {comments.map((comment, idx) => {
            const canEdit = currentUser?.id === comment.author.id
            return (
              <Comment
                comment={comment}
                canEdit={canEdit}
                key={idx}
                onUpdateComment={onUpdateComment}
                currentUser={currentUser}
              />
            )
          })}

          {!comments.length && (
            <div className="empty-notice">{t('noCommentsYetMessage')}</div>
          )}
        </div>
        {currentUser && !archived && (
          <form onSubmit={createNewComment}>
            <fieldset>
              <div className="new-comment-block">
                <Textarea
                  placeholder={t('addCommentPlaceholder')}
                  disabled={loading}
                  ref={textareaRef}
                />
                <div className="btn-container">
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    className="new-comment-btn"
                    variant={ButtonVariant.PrimaryDark}
                  >
                    {t('submit')}
                  </Button>
                  <Button
                    onClick={close}
                    disabled={loading}
                    variant={ButtonVariant.Secondary}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
        )}
      </div>
      <style jsx>{`
        .thread {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 100%;
          background-color: ${theme.colors.white};
        }

        .thread-subject {
          border-bottom: 1px solid ${theme.colors.gray400};
          text-align: center;
          padding: 5px 20px;
          margin: 0 10px;
        }

        .thread-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .highlighted-content {
          background-color: ${theme.colors.highlightColor};
        }

        .comments {
          padding: 5px 0;
        }

        .empty-notice {
          text-align: center;
          padding: 20px;
          font-style: italic;
        }

        .new-comment-block {
          border-top: 1px solid ${theme.colors.gray400};
          margin-top: 5px;
          padding-top: 10px;
        }

        .new-comment-block :global(textarea) {
          min-height: 4em;
          width: 100%;
          background-color: transparent;
          padding: 5px 0;
          margin-right: 10px;
          resize: vertical;
        }

        .new-comment-block :global(textarea:focus) {
          outline: none;
        }

        .btn-container {
          display: flex;
          align-items: center;
        }

        .btn-container :global(.new-comment-btn) {
          margin-right: 10px;
        }
      `}</style>
    </div>
  )
}

export default Thread
export type { ThreadProps }
