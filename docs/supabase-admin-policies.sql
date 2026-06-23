-- 管理员可以读取所有文章（包括未发布的）
CREATE POLICY "Admin read all" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 管理员可以创建文章
CREATE POLICY "Admin insert" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 管理员可以更新文章
CREATE POLICY "Admin update" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 管理员可以删除文章
CREATE POLICY "Admin delete" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');
