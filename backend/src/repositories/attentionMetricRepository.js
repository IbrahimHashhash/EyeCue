import BaseRepository from "./baseRepository.js";
import AttentionMetric from "../models/attentionMetric.js";

export default class AttentionMetricRepository extends BaseRepository {
  constructor(pool) {
    super(AttentionMetric, pool);
  }

  async forFrame(frame_log_id) {
    return this.findBy({ frame_log_id });
  }

   async storeAttentionMetric(frame_log_id, attention_score) {
    const query = `
      INSERT INTO attention_metric (frame_log_id, attention_score)
      VALUES ($1, $2)
      RETURNING *;
    `;
    if (attention_score == "attentive") {
      attention_score = 1;
    }
    else attention_score = 0; 

    const values = [frame_log_id, attention_score];
    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }
}