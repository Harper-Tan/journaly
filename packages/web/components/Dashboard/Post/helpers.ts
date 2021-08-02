import { PostClap, User } from '@/generated/graphql'
import { useTranslation } from '@/config/i18n'

/**
 * Get an element’s position relative to the document
 * @see https://stackoverflow.com/a/26230989/3610495
 */
export const getCoords = (htmlElement: HTMLElement) => {
  const box = htmlElement.getBoundingClientRect()

  const body = document.body
  const docEl = document.documentElement

  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
  const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft

  const clientTop = docEl.clientTop || body.clientTop || 0
  const clientLeft = docEl.clientLeft || body.clientLeft || 0

  const top = box.top + scrollTop - clientTop
  const left = box.left + scrollLeft - clientLeft

  return { y: Math.round(top), x: Math.round(left) }
}

export const getUsersClappedText = (claps: Array<
  { __typename?: 'PostClap' } & Pick<PostClap, 'id'> & {
    author: { __typename?: 'User' } & Pick<User, 'id' | 'name' | 'handle'>
  }
>, currentUserId: number | undefined) => {
  const { t } = useTranslation('post')

  const containsCurrentUser = claps.some(
    (clap) => clap.author.id === currentUserId)

  let usersClapped = claps
    .filter((clap) => clap.author.id !== currentUserId)
    .map((clap) => clap.author.name ? clap.author.name : clap.author.handle)

  if (containsCurrentUser) {
    usersClapped = [t('claps.currentUserPronoun'), ...usersClapped]
  }

  if (usersClapped.length == 0) {
    return t('claps.noUsersClapped')
  }
  else if (usersClapped.length == 1) {
    return t('claps.oneUserClapped', { name1: usersClapped[0] })
  }
  else if (usersClapped.length == 2) {
    return t('claps.twoUsersClapped', {
      name1: usersClapped[0],
      name2: usersClapped[1]
    })
  }
  else /* usersClapped.length > 2 */ {
    const numOthersClapped = usersClapped.length - 2
    return t('claps.manyUsersClapped', {
      name1: usersClapped[0],
      name2: usersClapped[1],
      numOthers: numOthersClapped
    })
  }
}