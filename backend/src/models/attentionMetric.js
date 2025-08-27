class AttentionMetric {
  static tableName = 'attention_metric';
  
  constructor({ id, frame_log_id, attention_score }) {
    this.id = id;
    this.frame_log_id = frame_log_id;
    this.attention_score = attention_score;
  }
}

export default AttentionMetric;