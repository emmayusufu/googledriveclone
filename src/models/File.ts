import mongoose, { Schema } from "mongoose";

const FileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    userId: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.models.File || mongoose.model("File", FileSchema);

export default File;
