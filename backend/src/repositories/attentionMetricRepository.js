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

    let score = 0;
    if (attention_score === "attentive") {
      score = 1;
    }

    await this.pool
      .request()
      .input("frame_log_id", frame_log_id)
      .input("attention_score", score)
      .query(`
      INSERT INTO ${AttentionMetric.tableName}
        (frame_log_id, attention_score)
      VALUES (@frame_log_id, @attention_score)
      `);
  }
}
