import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AnimatePresence,
  motion,
} from 'framer-motion'

import {
  FiAlertCircle,
  FiCheck,
  FiInfo,
  FiX,
} from 'react-icons/fi'

import ToastContext
  from '../context/ToastContext'


const DEFAULT_DURATION = 2800
const MAX_VISIBLE_TOASTS = 4

let nextToastId = 1


const TYPE_CONFIG = {
  success: {
    icon: FiCheck,
    label: 'Успешно',
  },

  error: {
    icon: FiAlertCircle,
    label: 'Грешка',
  },

  info: {
    icon: FiInfo,
    label: 'Информација',
  },
}


export default function ToastProvider({
  children,
}) {
  const [
    toasts,
    setToasts,
  ] = useState([])

  const timersRef =
    useRef(
      new Map(),
    )


  const clearTimer =
    useCallback(
      (id) => {
        const timer =
          timersRef.current
            .get(id)


        if (
          timer === undefined
        ) {
          return
        }


        window.clearTimeout(
          timer,
        )

        timersRef.current
          .delete(id)
      },
      [],
    )


  const dismiss =
    useCallback(
      (id) => {
        clearTimer(
          id,
        )

        setToasts(
          (current) =>
            current.filter(
              (toast) =>
                toast.id !== id,
            ),
        )
      },
      [
        clearTimer,
      ],
    )


  const show =
    useCallback(
      (
        message,
        {
          type = 'info',
          duration =
            DEFAULT_DURATION,
        } = {},
      ) => {
        const normalizedMessage =
          String(
            message ?? '',
          ).trim()


        if (!normalizedMessage) {
          return null
        }


        const normalizedType =
          Object.prototype
            .hasOwnProperty.call(
              TYPE_CONFIG,
              type,
            )
            ? type
            : 'info'


        const id =
          nextToastId++


        const toast = {
          id,
          type:
            normalizedType,
          message:
            normalizedMessage,
        }


        setToasts(
          (current) => [
            ...current,
            toast,
          ].slice(
            -MAX_VISIBLE_TOASTS,
          ),
        )


        if (
          Number.isFinite(
            duration,
          )
          && duration > 0
        ) {
          const timer =
            window.setTimeout(
              () => {
                timersRef.current
                  .delete(id)

                setToasts(
                  (current) =>
                    current.filter(
                      (item) =>
                        item.id !== id,
                    ),
                )
              },
              duration,
            )


          timersRef.current
            .set(
              id,
              timer,
            )
        }


        return id
      },
      [],
    )


  const success =
    useCallback(
      (
        message,
        options = {},
      ) =>
        show(
          message,
          {
            ...options,
            type: 'success',
          },
        ),
      [
        show,
      ],
    )


  const error =
    useCallback(
      (
        message,
        options = {},
      ) =>
        show(
          message,
          {
            ...options,
            type: 'error',
          },
        ),
      [
        show,
      ],
    )


  const info =
    useCallback(
      (
        message,
        options = {},
      ) =>
        show(
          message,
          {
            ...options,
            type: 'info',
          },
        ),
      [
        show,
      ],
    )


  const clear =
    useCallback(
      () => {
        for (
          const timer
          of timersRef.current
            .values()
        ) {
          window.clearTimeout(
            timer,
          )
        }


        timersRef.current
          .clear()

        setToasts([])
      },
      [],
    )


  useEffect(() => {
    const visibleIds =
      new Set(
        toasts.map(
          (toast) =>
            toast.id,
        ),
      )


    for (
      const [
        id,
        timer,
      ]
      of timersRef.current
        .entries()
    ) {
      if (
        visibleIds.has(
          id,
        )
      ) {
        continue
      }


      window.clearTimeout(
        timer,
      )

      timersRef.current
        .delete(id)
    }
  }, [
    toasts,
  ])


  useEffect(
    () => () => {
      for (
        const timer
        of timersRef.current
          .values()
      ) {
        window.clearTimeout(
          timer,
        )
      }


      timersRef.current
        .clear()
    },
    [],
  )


  const value =
    useMemo(
      () => ({
        show,
        success,
        error,
        info,
        dismiss,
        clear,
      }),
      [
        show,
        success,
        error,
        info,
        dismiss,
        clear,
      ],
    )


  return (
    <ToastContext.Provider
      value={value}
    >
      {children}


      <div
        className="toast-viewport"
        aria-label="Известувања"
      >
        <AnimatePresence
          initial={false}
        >
          {toasts.map(
            (toast) => {
              const config =
                TYPE_CONFIG[
                  toast.type
                ]

              const Icon =
                config.icon

              const isError =
                toast.type
                === 'error'


              return (
                <motion.div
                  key={
                    toast.id
                  }
                  className={
                    `toast-item toast-${toast.type}`
                  }
                  role={
                    isError
                      ? 'alert'
                      : 'status'
                  }
                  aria-live={
                    isError
                      ? 'assertive'
                      : 'polite'
                  }
                  aria-atomic="true"
                  initial={{
                    opacity: 0,
                    x: 18,
                    y: 8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: 14,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: [
                      0.2,
                      0,
                      0,
                      1,
                    ],
                  }}
                >
                  <span
                    className="toast-icon"
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>


                  <span className="toast-copy">
                    <strong>
                      {config.label}
                    </strong>

                    <span>
                      {toast.message}
                    </span>
                  </span>


                  <button
                    type="button"
                    className="toast-close"
                    aria-label={
                      `Затвори известување: ${toast.message}`
                    }
                    onClick={() =>
                      dismiss(
                        toast.id,
                      )
                    }
                  >
                    <FiX
                      aria-hidden="true"
                    />
                  </button>
                </motion.div>
              )
            },
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}