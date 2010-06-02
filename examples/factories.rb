require 'date'

Factory.sequence(:post_title) { |n| "A Post #{n}" }

Factory.define(:post) do |post|
  post.title { Factory.next(:post_title) }
  post.body "*Post Body*"
  post.tags "one two three"

  post.draft true
  post.posted_on Date.today
  post.closed false
end

Factory.define(:session) do |session|
  session.username 'astro'
  session.password 'p4ssw0rd'
end