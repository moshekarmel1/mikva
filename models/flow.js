var mongoose = require('mongoose');

var FlowSchema = new mongoose.Schema({
    sawBlood: {
      type: Date
    },
    hefsekTahara: {
      type: Date
    },
    mikvaNight: {
      type: Date
    },
    day30: {
      type: Date
    },
    day31: {
      type: Date
    },
    haflaga: {
      type: Date
    },
    created: {
      type: Date,
      default: Date.now
    },
    createdBy: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
});

mongoose.model('Flow', FlowSchema);
