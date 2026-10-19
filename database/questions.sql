-- Migração proposta; ainda não aplicada a um banco em produção.
CREATE TABLE IF NOT EXISTS exam_sources (
 id text PRIMARY KEY, institution text NOT NULL, edition text NOT NULL,
 booklet text NOT NULL, exam_url text NOT NULL, answer_url text,
 exam_sha256 char(64) NOT NULL, answer_sha256 char(64),
 rights_status text NOT NULL DEFAULT 'pending' CHECK(rights_status IN ('pending','cleared','restricted')),
 rights_basis text, retrieved_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(institution,edition,booklet,exam_sha256)
);
CREATE TABLE IF NOT EXISTS questions (
 id text PRIMARY KEY, source_id text NOT NULL REFERENCES exam_sources(id),
 original_number integer NOT NULL CHECK(original_number>0), source_page integer NOT NULL,
 subject text NOT NULL, topic text NOT NULL, skill text, statement text,
 image_key text, options jsonb NOT NULL, content_sha256 char(64) NOT NULL,
 difficulty numeric CHECK(difficulty BETWEEN 0 AND 1), difficulty_method text,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','withdrawn')),
 revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(source_id,original_number)
);
-- Gabaritos em tabela separada. A API de seleção não deve retornar esta tabela.
CREATE TABLE IF NOT EXISTS question_answers (
 question_id text PRIMARY KEY REFERENCES questions(id), answer_key text,
 status text NOT NULL CHECK(status IN ('preliminary','final','annulled','pending')),
 explanation text, reviewed_by text, reviewed_at timestamptz
);
CREATE TABLE IF NOT EXISTS attempts (
 id uuid PRIMARY KEY, student_uid text NOT NULL, question_id text NOT NULL REFERENCES questions(id),
 question_revision integer NOT NULL, selected_key text NOT NULL, correct boolean,
 elapsed_ms integer NOT NULL CHECK(elapsed_ms>=0), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(student_uid,id)
);
CREATE INDEX IF NOT EXISTS questions_filters ON questions(subject,topic,status);
CREATE INDEX IF NOT EXISTS sources_edition ON exam_sources(institution,edition);
CREATE INDEX IF NOT EXISTS attempts_student ON attempts(student_uid,created_at DESC);
