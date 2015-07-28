<?php
namespace Org\Util;
require_once 'jpush/vendor/autoload.php';

use JPush\Model as M;
use JPush\JPushClient;
use JPush\JPushLog;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

use JPush\Exception\APIConnectionException;
use JPush\Exception\APIRequestException;
class Push {
    public  $master_secret = '9d6ccc5cac5069c2b9953a94';
    public  $app_key='a909570e198bd956333cdea9';
	public function index($action){
        //$alert = $action['title'].'.'.$action['content'];
        $title = $action['title'];
        $alert = $action['content'];
        $platform = $action['platform'];
        $detail_id = $action['detail_id'];
        $type = $action['type'];
        //JPushLog::setLogHandlers(array(new StreamHandler('jpush.log', Logger::DEBUG)));
        $client = new JPushClient($this->app_key, $this->master_secret);

//easy push
        try {
            $notification = array();
            $notification['android'] = array('alert'=>$alert,'title'=>$title,'builder_id'=>3,'extras'=>array('id'=>$detail_id,'msgType'=>$type));
            $notification['ios'] = array('alert'=>$alert,'sound'=>$title,'builder_id'=>1,'badge'=>1,'extras'=>array('id'=>$detail_id,'msgType'=>$type));
            $result = $client->push()
                ->setPlatform($platform)
                ->setAudience(M\all)
                ->setNotification($notification)
                ->setOptions(array('apns_production'=>1))
                ->printJSON()
                ->send();
            /*$result = $client->push()
                ->setPlatform($platform)
                ->setAudience(M\all)
                ->setNotification(M\notification($alert))
                ->printJSON()
                ->send();*/
            echo '恭喜推送消息成功';
            /*echo 'Push Success.' . $br;
            echo 'sendno : ' . $result->sendno . $br;
            echo 'msg_id : ' .$result->msg_id . $br;
            echo 'Response JSON : ' . $result->json . $br;*/
            /*$result = $client->push()
                ->setPlatform(M\all)
                ->setAudience(M\audience(M\tag(array('tag4'))))
                ->setNotification(M\notification($alert))
                ->printJSON()
                ->send();
            echo 'Push Success.' . $br;
            echo 'sendno : ' . $result->sendno . $br;
            echo 'msg_id : ' .$result->msg_id . $br;
            echo 'Response JSON : ' . $result->json . $br;*/
        } catch (APIRequestException $e) {
            echo 'Push Fail.' . $br;
            echo 'Http Code : ' . $e->httpCode . $br;
            echo 'code : ' . $e->code . $br;
            echo 'Error Message : ' . $e->message . $br;
            echo 'Response JSON : ' . $e->json . $br;
            echo 'rateLimitLimit : ' . $e->rateLimitLimit . $br;
            echo 'rateLimitRemaining : ' . $e->rateLimitRemaining . $br;
            echo 'rateLimitReset : ' . $e->rateLimitReset . $br;
        } catch (APIConnectionException $e) {
            echo 'Push Fail: ' . $br;
            echo 'Error Message: ' . $e->getMessage() . $br;
            echo 'IsResponseTimeout: ' . $e->isResponseTimeout . $br;
        }
	}
    public function set_push($action){
        $title = $action['title'];
        $alert = $action['content'];
        $detail_id = $action['detail_id'];
        $type = $action['type'];
        $client = new JPushClient($this->app_key, $this->master_secret);

        $notification = array();
        $notification['android'] = array('alert'=>$alert,'title'=>$title,'builder_id'=>3,'extras'=>array('id'=>$detail_id,'msgType'=>$type));
        $notification['ios'] = array('alert'=>$alert,'sound'=>$title,'builder_id'=>1,'extras'=>array('id'=>$detail_id,'msgType'=>$type));
        $result = $client->push()
            ->setPlatform(M\all)
            ->setAudience(M\all)
            ->setNotification($notification)
            ->setOptions(array('time_to_live'=>86400*5))
            ->printJSON()
            ->send();
        return 1;
    }
}

?>