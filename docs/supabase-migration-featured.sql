-- 为 posts 表添加推荐字段
ALTER TABLE posts ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- 索引
CREATE INDEX idx_posts_featured ON posts(featured);
