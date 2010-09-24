app_env = ENV['APP_ENV'] || 'production'
app_root = ENV['APP_ROOT'] || "/u/apps/adamelliot"
unicorn = "/home/deploy/.rvm/gems/ruby-1.9.2-p0/bin/unicorn"

God.watch do |w|
  w.env = {
    'PATH' => "/home/deploy/.rvm/gems/ruby-1.9.2-p0/bin:/home/deploy/.rvm/bin:/home/deploy/.rvm/ruby-1.9.2-p0/bin:$PATH",
    'RUBY_VERSION' => 'ruby 1.9.2',
    'GEM_HOME'     => '/home/deploy/.rvm/gems/ruby-1.9.2-p0',
    'GEM_PATH'     => '/home/deploy/.rvm/gems/ruby-1.9.2-p0',
    'BUNDLE_PATH'  => '/home/deploy/.rvm/gems/ruby-1.9.2-p0'
  }
  
  w.name = "adamelliot"
  w.interval = 30.seconds # default

  # unicorn needs to be run from the app root
  w.start = "cd #{app_root}/current && #{unicorn} -c #{app_root}/current/config/unicorn.rb -E #{app_env} -D"

  # QUIT gracefully shuts down workers
  w.stop = "kill -QUIT `cat #{app_root}/shared/tmp/pids/unicorn.pid`"

  # USR2 causes the master to re-create itself and spawn a new worker pool
  w.restart = "kill -USR2 `cat #{app_root}/shared/tmp/pids/unicorn.pid`"

  w.start_grace = 10.seconds
  w.restart_grace = 10.seconds
  w.pid_file = "#{app_root}/shared/tmp/pids/unicorn.pid"

  w.uid = 'deploy'
  w.gid = 'deploy'

  w.behavior(:clean_pid_file)

  w.start_if do |start|
    start.condition(:process_running) do |c|
      c.interval = 5.seconds
      c.running = false
    end
  end

  w.restart_if do |restart|
    restart.condition(:memory_usage) do |c|
      c.above = 300.megabytes
      c.times = [3, 5] # 3 out of 5 intervals
    end

    restart.condition(:cpu_usage) do |c|
      c.above = 50.percent
      c.times = 5
    end
  end

  # lifecycle
  w.lifecycle do |on|
    on.condition(:flapping) do |c|
      c.to_state = [:start, :restart]
      c.times = 5
      c.within = 5.minute
      c.transition = :unmonitored
      c.retry_in = 10.minutes
      c.retry_times = 5
      c.retry_within = 2.hours
    end
  end
end
