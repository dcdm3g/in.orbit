type Error = 'GOAL_NOT_FOUND' | 'GOAL_ALREADY_COMPLETED'

type Failure<E extends Error> = {
  kind: 'failure'
  error: E
  message: string
}

type Success<D> = {
  kind: 'success'
  data: D
}

export type Result<D, E extends Error> = Success<D> | Failure<E>
