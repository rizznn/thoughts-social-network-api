const { Schema, model, Types } = require('mongoose');
const moment = require('moment');

// Reaction Schema
const ReactionSchema = new Schema(
    {
        reactionId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId(),
        },
        reactionBody: {
            type: String,
            required: true,
            maxLength: 280
        },
        username: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdAtTimestamp => moment(createdAtTimestamp).format(('MMM DD, YYYY [at] h:mm a'))
        }
    }
)

const ThoughtSchema = new Schema(
    {
        thoughtText: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 280
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdAtTimestamp => moment(createdAtTimestamp).format(('MMM DD, YYYY [at] h:mm a'))
        },
        // The user that created this thought
        username: {
            type: String,
            required: true
        },
        // use ReactionSchema to validate data for a reply
        reactions: [ReactionSchema]
    },
    {
        toJSON: {
          virtuals: true,
          getters: true
        },
        id: false
    }
);

// retrieves the length of the thought's reactions array field on query
ThoughtSchema.virtual('reactionCount').get(function() {
    return this.reactions.length;
});

// Create the Thought model using the ThoughtSchema
const Thought = model('Thought', ThoughtSchema);

// export the Thought model
module.exports = Thought;