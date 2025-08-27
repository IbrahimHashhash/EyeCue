import BaseRepository from "./baseRepository.js";
import AttentionMetric from "../models/attentionMetric.js";

export default class AttentionMetricRepository extends BaseRepository {
  constructor(pool) {
    super(AttentionMetric, pool);
  }

  async forFrame(frame_log_id) {
    return this.findBy({ frame_log_id });
  }
}