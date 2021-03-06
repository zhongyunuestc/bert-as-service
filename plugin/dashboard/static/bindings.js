Vue.use(VueCharts);

const vm = new Vue({
    el: '#mrc-ui',
    data: {
        serverUrl: 'http://100.102.33.53:8081',
        databasePath: '/bert_monitor',
        results: [],
        top_deck: [],
        second_deck: [],
        hist_num_data_request: {
            'last': 0,
            'value': [],
            'label': []
        },
        hist_num_client: {
            'last': 0,
            'value': [],
            'label': []
        },
        lineOption: {
            label: '',
            responsive: true,
            maintainAspectRatio: true,
            fill: true,
            title: {
                display: false,
                position: 'bottom',
                text: ''
            }
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.refreshDatabase();
        })
    },
    computed: {
        databaseUrl: function () {
            return this.serverUrl + this.databasePath
        },
        runningTime: function () {
            return moment(this.results.server_start_time).fromNow()
        }
    },
    methods: {
        refreshDatabase: function () {
            $.ajax({
                url: this.databaseUrl,
                dataType: 'text',
                cache: false,
                beforeSend: function () {
                    console.log("Loading");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                success: function (data) {
                    console.log('Success');
                    vm.results = JSON.parse(data);
                    vm.top_deck = [];
                    vm.second_deck = [];
                    // add to top deck
                    vm.addToDeck('Server version', vm.results.server_version, vm.top_deck);
                    vm.addToDeck('Running onn', vm.results.cpu ? 'CPU' : 'GPU', vm.top_deck);
                    vm.addToDeck('Uptime', vm.runningTime, vm.top_deck);
                    vm.addToDeck('Workers', vm.results.num_worker, vm.top_deck);
                    vm.addToDeck('Num clients', vm.results.statistic.num_total_client, vm.top_deck);

                    // add to second deck
                    vm.addToDeck('Data Req.', vm.results.statistic.num_data_request, vm.second_deck);
                    vm.addToDeck('Sys Req.', vm.results.statistic.num_sys_request, vm.second_deck);
                    vm.addToDeck('Min Req. interval', moment.duration(vm.results.statistic.min_last_two_interval, 'seconds').humanize(), vm.second_deck);
                    vm.addToDeck('Max Req. interval', moment.duration(vm.results.statistic.max_last_two_interval, 'seconds').humanize(), vm.second_deck);
                    vm.addToDeck('Avg Req. interval', moment.duration(vm.results.statistic.avg_last_two_interval, 'seconds').humanize(), vm.second_deck);
                    vm.addToDeck('Min Req./Client', vm.results.statistic.min_request_per_client, vm.second_deck);
                    vm.addToDeck('Max Req./Client', vm.results.statistic.max_request_per_client, vm.second_deck);
                    vm.addToDeck('Avg Req./Client', vm.results.statistic.avg_request_per_client, vm.second_deck);
                    vm.addToDeck('Max seq len', vm.results.max_seq_len, vm.second_deck);

                    vm.addNewTimeData(vm.hist_num_data_request, vm.results.statistic.num_data_request, true);
                    vm.addNewTimeData(vm.hist_num_client, vm.results.statistic.num_total_client, false);
                },
                complete: function () {
                    console.log('Finished all tasks');
                }
            });
        },
        addToDeck: function (text, value, deck) {
            deck.push({'text': text, 'value': value})
        },
        addNewTimeData: function (ds, new_val, delta) {
            ds.value.push(new_val - (delta ? ds.last : 0));
            ds.last = new_val;
            ds.label.push(moment().format('YY-MM-DD h:mm:ss'));
        }
    }
});


setInterval(function () {
    vm.refreshDatabase();
    console.log('update database!')
}, 60 * 1000);
