/// <reference types="vite/client" />

// Позволяет импортировать CSS как side-effect без ошибок TS
declare module '*.css' {
  const content: Record<string, string>
  export default content
}