APP_ROOT = "/u/apps/adamelliot"

worker_processes 4

working_directory "#{APP_ROOT}/current"

listen "#{APP_ROOT}/shared/tmp/sockets/unicorn.sock", :backlog => 64

timeout 30

pid "#{APP_ROOT}/shared/tmp/pids/unicorn.pid"

stderr_path "#{APP_ROOT}/shared/log/unicorn.stderr.log"
stdout_path "#{APP_ROOT}/shared/log/unicorn.stdout.log"
