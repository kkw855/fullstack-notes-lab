import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    // 💡 res.json()으로 변환될 때 적용되는 옵션
    toJSON: {
      virtuals: true, // 1. 가상 필드인 'id' 를 JSON에 포함시킵니다.
      transform: (doc, ret) => {
        delete ret._id; // 2. 기존의 '_id' 필드를 삭제합니다.
        delete ret.__v; // 3. Mongoose 버전 키인 '__v'도 함께 삭제합니다.
      },
    },
  },
)

const Note = mongoose.model('Note', noteSchema)

export default Note
